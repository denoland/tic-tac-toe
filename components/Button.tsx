import { JSX } from "preact";
import { css, keyframes } from "twind/css";
import { tw } from "twind";

const buttonClasses =
  "px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return <button {...props} class={`${buttonClasses} ${props.class || ""}`} />;
}

export function ButtonLink(props: JSX.HTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} class={`${buttonClasses} ${props.class || ""}`} />;
}

const rainbowBackgroundKeyframes = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "100% 50%" },
});
const rainbowBackground = css`
background: linear-gradient(to right, 
  #ff0080, #ff3d4d, #ff6844, #ff8c00, #f1c40f, #2ecc71, #3498db, #8e44ad, #ff0080, #ff0080);
background-size: 2000% 100%;
animation: ${rainbowBackgroundKeyframes} 7s linear infinite;
color: #fff;
`;

export function ButtonLinkMovingRainbow(
  props: JSX.HTMLAttributes<HTMLAnchorElement>,
) {
  return (
    <a
      {...props}
      class={tw`px-4 py-2 text-sm font-semibold text-white rounded ${rainbowBackground} ${
        props.class || ""
      }`}
    />
  );
}
