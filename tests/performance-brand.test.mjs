import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function loadTs(path, { env = {}, dependencies = {} } = {}) {
  const output = ts.transpileModule(source(`src/${path}`), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    module: { exports },
    process: { env },
    URL,
    crypto,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import in ${path}: ${name}`);
    },
  });
  return exports;
}

test("the proxy skips the marketing pages and only refreshes auth under /admin", () => {
  const nextServer = {
    NextResponse: {
      next: () => ({ kind: "next", cookies: { set() {} } }),
    },
  };
  let authChecks = 0;
  const proxyModule = loadTs("proxy.ts", {
    dependencies: {
      "next/server": nextServer,
      "@/lib/supabase/env": { getSupabaseUrl: () => "https://x.supabase.co", getSupabaseAnonKey: () => "anon" },
      "@supabase/ssr": {
        createServerClient: () => ({ auth: { getClaims: async () => { authChecks += 1; return { data: null }; } } }),
      },
    },
  });

  const matcher = new RegExp(`^${proxyModule.config.matcher[0]}$`);
  for (const path of ["/template", "/template/terra-botanica", "/demo/terra-botanica", "/demo", "/icon.svg", "/demo/x/cover.jpg", "/sitemap.xml"]) {
    assert.equal(matcher.test(path), false, `${path} must skip the proxy`);
  }
  for (const path of ["/admin", "/admin/dashboard", "/rania-dimas", "/template-kita", "/demo-kita"]) {
    assert.equal(matcher.test(path), true, `${path} must run the proxy`);
  }

  const request = (pathname, cookies = {}) => ({
    nextUrl: { pathname },
    cookies: {
      get: (name) => (cookies[name] ? { value: cookies[name] } : undefined),
      set: (name, value) => { cookies[name] = value; },
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    },
  });

  return (async () => {
    await proxyModule.proxy(request("/"));
    await proxyModule.proxy(request("/rania-dimas", { session_id: "s" }));
    assert.equal(authChecks, 0, "public pages never wait on Supabase Auth");
    await proxyModule.proxy(request("/admin/dashboard"));
    assert.equal(authChecks, 1);
  })();
});

test("next/image resizes app files and bucket uploads, and passes other hosts through", () => {
  const { isOptimizableImage } = loadTs("themes/shared/image-source.ts", {
    env: { NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" },
  });
  assert.equal(isOptimizableImage("/demo/terra-botanica/cover.jpg"), true);
  assert.equal(isOptimizableImage("https://x.supabase.co/storage/v1/object/public/invitation-media/a.jpg"), true);
  assert.equal(isOptimizableImage("//cdn.example.com/a.jpg"), false);
  assert.equal(isOptimizableImage("https://example.com/a.jpg"), false);

  for (const file of [
    "src/themes/nusantara-ivory/components/EditorialImage.tsx",
    "src/themes/terra-botanica/components/EditorialImage.tsx",
    "src/themes/midnight-atelier/components/AtelierImage.tsx",
    "src/themes/cobalt-riviera/components/RivieraImage.tsx",
  ]) {
    assert.match(source(file), /unoptimized=\{!isOptimizableImage\(/, file);
  }
  assert.match(source("src/components/marketing/phone-mockup.tsx"), /from "next\/image"/);
});

test("admin pages share one cached auth check and stream behind a skeleton", () => {
  assert.match(source("src/server/auth/current-admin.ts"), /export const getCurrentAdmin = cache\(/);
  for (const file of [
    "src/app/admin/(protected)/layout.tsx",
    "src/app/admin/(protected)/(shell)/layout.tsx",
    "src/app/admin/login/page.tsx",
  ]) {
    const text = source(file);
    assert.match(text, /getCurrentAdmin\(\)/, file);
    assert.doesNotMatch(text, /auth\.getUser\(\)/, file);
  }
  assert.match(source("src/app/admin/(protected)/(shell)/loading.tsx"), /AdminPageSkeleton/);
  assert.match(source("src/app/admin/(protected)/(shell)/invitations/[id]/loading.tsx"), /AdminPageSkeleton/);
});

test("every brand spot uses the Temuraya gapura mark", () => {
  const icon = source("src/app/icon.svg");
  assert.match(icon, /#1f2b25/);
  assert.doesNotMatch(icon, /R&amp;F|<text/, "no leftover demo couple monogram");
  for (const file of [
    "src/components/marketing/brand-mark.tsx",
    "src/components/admin/app-sidebar.tsx",
    "src/app/admin/login/page.tsx",
    "src/app/admin/(protected)/(shell)/layout.tsx",
  ]) {
    const text = source(file);
    assert.match(text, /<TemurayaMark\b/, file);
    assert.doesNotMatch(text, /^\s*T\s*$/m, `${file} still has the letter monogram`);
  }
  for (const file of ["src/app/apple-icon.png", "src/app/opengraph-image.png"]) {
    const png = readFileSync(new URL(`../${file}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), "PNG", file);
  }
});
