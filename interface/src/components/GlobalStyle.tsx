import { css, Global } from '@emotion/react';
import localFont from '@next/font/local';

const archivo = localFont({
  src: '../fonts/Archivo-Variable.ttf',
  variable: '--font-archivo',
});

export const GlobalStyle: React.FC = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
        word-break: keep-all;
        font-family: ${archivo.style.fontFamily};
      }

      a {
        text-decoration: none;
        cursor: pointer;
      }

      input,
      button {
        outline: 0;
        background-color: transparent;
      }

      button {
        cursor: pointer;
      }
    `}
  />
);
