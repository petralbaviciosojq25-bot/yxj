// Local animation study: deform selected hair regions while preserving lettering.
const strands = [
  { path: "M1155 28 C1070 10 1030 77 1035 142 C1030 203 928 226 856 215 C820 211 794 222 788 242 C876 251 959 237 1048 196 C1103 151 1100 88 1155 28Z", duration: 5.4, strength: 5 },
  { path: "M1163 46 C1078 80 1089 168 1005 210 C945 244 862 241 820 268 C800 282 791 300 803 315 C852 281 929 281 1013 253 C1101 221 1124 128 1163 46Z", duration: 6.7, strength: 7 },
  { path: "M1138 92 C1100 144 1118 204 1048 250 C995 282 912 267 845 297 C825 307 805 322 813 341 C874 317 934 332 1007 306 C1097 277 1137 194 1138 92Z", duration: 4.9, strength: 6 },
  { path: "M1117 153 C1104 215 1112 275 1054 302 C1003 327 968 314 929 337 C911 354 912 377 934 392 C958 361 1000 368 1052 350 C1111 325 1159 239 1117 153Z", duration: 7.8, strength: 5 },
];

export function HairMotion({ source }) {
  return (
    <svg className="hair-motion" viewBox="0 0 1920 1080" aria-hidden="true" focusable="false">
      <defs>
        <mask id="hair-behind-title" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
          <rect width="1920" height="1080" fill="white" />
          <rect x="90" y="332" width="950" height="368" fill="black" />
        </mask>
        {strands.map((strand, index) => (
          <g key={index}>
            <clipPath id={`hair-strand-${index}`}><path d={strand.path} /></clipPath>
            <filter id={`hair-wind-${index}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="1" seed={index + 3} result="wind" />
              <feDisplacementMap in="SourceGraphic" in2="wind" xChannelSelector="R" yChannelSelector="G" scale="0">
                <animate attributeName="scale" values={`0;${strand.strength};1;${-strand.strength * 0.5};0`} dur={`${strand.duration}s`} repeatCount="indefinite" />
              </feDisplacementMap>
            </filter>
          </g>
        ))}
      </defs>
      <g mask="url(#hair-behind-title)">
        {strands.map((_, index) => <g key={index} clipPath={`url(#hair-strand-${index})`}>
          <image href={source} width="1920" height="1080" filter={`url(#hair-wind-${index})`} />
        </g>)}
      </g>
    </svg>
  );
}
