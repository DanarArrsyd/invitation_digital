/** Original melati-inspired engraving. Decorative ink only, no external assets. */
export function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 480" fill="none" className={`ni-botanical ${className}`} aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M62 464C184 366 107 262 256 70M94 432C221 392 223 307 314 260M143 343C92 268 64 205 50 125M182 247C260 206 301 161 302 99" />
        <path d="M136 361C96 354 58 325 57 278c52 7 87 44 79 83ZM149 309c-6-48 9-89 44-109 12 49-6 87-44 109ZM104 263c-39-7-67-34-73-72 43 4 73 36 73 72ZM172 225c-35-35-40-74-25-105 35 32 47 72 25 105" />
        <path d="M172 225c-35-35-40-74-25-105 35 32 47 72 25 105ZM219 164c6-47 32-76 67-81-2 44-31 73-67 81ZM214 370c-1-39 20-68 54-81 1 39-19 66-54 81ZM264 318c30 5 61-12 74-43-33-4-60 14-74 43ZM99 426c-37-3-66-22-81-54 36-1 68 20 81 54Z" fill="currentColor" fillOpacity=".08" />
        <path d="m64 288 66 65m27-57 31-84m-149-12 58 55m55-119 17 76m55-57 52-60M226 356l32-54" />
        {[{x:249,y:77,s:1},{x:60,y:146,s:.75},{x:294,y:249,s:.8}].map(({x,y,s},i)=>(
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {[0,72,144,216,288].map(angle=>(<path key={angle} transform={`rotate(${angle})`} d="M0 2C-21-11-24-35-11-43 2-50 21-32 15-17 12-9 5-3 0 2Z" fill="var(--ni-ivory)" fillOpacity=".65" />))}
            {[0,72,144,216,288].map(angle=>(<path key={angle} transform={`rotate(${angle})`} d="M0 2C-21-11-24-35-11-43 2-50 21-32 15-17 12-9 5-3 0 2ZM0-5l-5-23" />))}
            <circle r="5" fill="currentColor" fillOpacity=".22" /><circle r="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function BotanicalDivider({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 220 32" className={`ni-botanical-divider ${className}`} fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth=".8"><path d="M4 16h70m72 0h70M80 16h60M110 5l11 11-11 11-11-11Z" /><path d="M87 16q-8-15-16-9 3 10 16 9Zm0 0q-8 15-16 9 3-10 16-9Zm46 0q8-15 16-9-3 10-16 9Zm0 0q8 15 16 9-3-10-16-9Z" /></g>
  </svg>;
}
