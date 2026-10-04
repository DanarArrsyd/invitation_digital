/**
 * Self-hosted faces for every registered theme, plus each theme's
 * `fonts.css` mapping its font tokens to those faces.
 *
 * Imported only by routes that render a theme (the public invitation and
 * the admin preview), never by the root layout, so admin screens don't
 * carry wedding font CSS. Kept out of the theme modules themselves so they
 * stay plain TS/TSX that tests can load without a CSS loader.
 */

// nusantara-ivory
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/lora";
import "@fontsource-variable/lora/wght-italic.css";
import "./nusantara-ivory/fonts.css";

// terra-botanica
import "@fontsource/herr-von-muellerhoff/400.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/600.css";
import "@fontsource/spectral/700.css";
import "./terra-botanica/fonts.css";

// midnight-atelier
import "@fontsource-variable/bodoni-moda";
import "@fontsource/ibm-plex-sans-condensed/400.css";
import "@fontsource/ibm-plex-sans-condensed/500.css";
import "@fontsource/ibm-plex-sans-condensed/600.css";
import "./midnight-atelier/fonts.css";

// cobalt-riviera
import "@fontsource-variable/familjen-grotesk";
import "@fontsource-variable/newsreader";
import "./cobalt-riviera/fonts.css";
