import { css, keyframes } from "twind/css";

const rainbowBackgroundKeyframes = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "100% 50%" },
});
export const rainbowBackground = css`
background: linear-gradient(to right, 
  #ff008022, #ff3d4d22, #ff684422, #ff8c0022, #f1c40f22, #2ecc7122, #3498db22, #8e44ad22, #ff008022, #ff008022);
background-size: 2000% 100%;
animation: ${rainbowBackgroundKeyframes} 7s linear infinite;
`;
