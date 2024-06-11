import styled, { createGlobalStyle, css } from "styled-components";

const Styles = createGlobalStyle`
  html {
    box-sizing: border-box;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    line-height: 1.5;
    color: #121212;
    background-color: white;

    @media (prefers-color-scheme: dark) {
      color: #ededed;
      background-color: #161616;
    }
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;

    @media (min-width: 768px)  {
      flex-direction: row;
    }
  }

  html {
    font-size: 16px;
  }

  pre {
    font-size: 13px;
  }

  i {
    color: #818181;
  }
`;

export default Styles;

export const Title = styled.h1`
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 1rem;
  border-bottom: 1px solid #e3e3e3;
  line-height: 1;

  @media (prefers-color-scheme: dark) {
    border-bottom-color: #5c5c5c;
  }

  &::before {
    content: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 800 800' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3Cg transform='matrix(1,0,0,0.782564,-140,-49.3885)'%3E%3Cg id='Ebene1'%3E%3Cg transform='matrix(1,0,0,1.12612,0,-132.847)'%3E%3Cpath d='M450,740L360,317C378.556,291.458 435.338,270.771 474.42,242.559C492.185,229.735 587.815,229.735 605.58,242.559C644.662,270.771 701.444,291.458 720,317L630,740L540,1053.36L450,740Z' style='fill:white;'/%3E%3C/g%3E%3Cg transform='matrix(1,0,0,1.12612,0,-132.847)'%3E%3Cpath d='M540,1053.36L478,746.308C489.941,674.032 490.876,413.887 508.591,313.27C508.591,313.27 486.822,278.166 474.42,242.559C492.185,229.735 509.681,216.565 524.737,202.982L555.263,202.982C570.319,216.565 587.815,229.735 605.58,242.559C593.178,278.166 571.409,313.27 571.409,313.27C589.124,413.887 590.059,674.032 602,746.308L540,1053.36Z' style='fill:rgb(173,0,7);'/%3E%3C/g%3E%3Cg transform='matrix(-1,0,0,1,1080,-1.42109e-14)'%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L194,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(0,2,27);'/%3E%3C/g%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L193.987,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(0,2,27);'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");

    margin-right: 0.5rem;
    position: relative;
    top: 1px;

    width: 24px;
    height: 24px;
    padding: 3px;
    margin: -3px 0.75rem -3px 0;
    border-radius: 4px;

    @media (prefers-color-scheme: dark) {
      background-color: #ce0008;
    }
  }
`;

const elementStyle = css`
  font-size: 1rem;
  font-family: inherit;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  appearance: none;
  box-shadow:
    0 0px 1px hsla(0, 0%, 0%, 0.2),
    0 1px 2px hsla(0, 0%, 0%, 0.2);
  background-color: white;
  line-height: 1.5;
  margin: 0;
  color: inherit;

  &:disabled {
    opacity: 0.8;
    box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.2);
  }

  &:not(:disabled):hover {
    box-shadow:
      0 0px 1px hsla(0, 0%, 0%, 0.6),
      0 1px 2px hsla(0, 0%, 0%, 0.2);
  }

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }
`;

export const TextArea = styled.textarea`
  ${elementStyle}
`;

export const Input = styled.input`
  ${elementStyle}
`;

export const Button = styled.button.attrs({ tabIndex: 0 })`
  ${elementStyle}
  color: #3992ff;
  font-weight: 500;
  user-select: none;
  -webkit-user-select: none;

  &:not(:disabled):active {
    box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
    transform: translateY(1px);
  }
`;

export const Select = styled.select`
  ${elementStyle}
  font-size: 0.8em;
  padding: 0.25rem 0.5rem;
`;

export const Status = styled.span`
  text-align: start;
  font-size: 0.9rem;
  font-weight: 500;
  font-stretch: semi-condensed;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 0.5rem;
  color: white;

  ${({ $status }) => {
    let color;
    let shadow;

    switch ($status) {
      default:
      case "enqueued":
      case "waiting":
      case "timeout":
        color = "#a4a4a4";
        shadow = "#a4a4a432";
        break;

      case "running":
        color = "#eeb004";
        shadow = "#eeb00432";
        break;

      case "success":
        color = "hsl(98, 98%, 42%)";
        shadow = "hsla(98, 98%, 42%, 0.2)";
        break;

      case "failed":
        color = "#f44250";
        shadow = "#f4425032";
        break;
    }

    return `
      box-shadow: 0 0px 1px ${shadow}, 0 1px 2px ${shadow};
      background-color: ${color};
    `;
  }};
`;
