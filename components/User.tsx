import { User } from "🛠️/types.ts";

export function UserNameVertical(props: { class?: string; user: User }) {
  return (
    <div class={props.class}>
      <div class="text-lg font-semibold">
        {props.user.name || `@${props.user.login}`}
      </div>
      {props.user.name && (
        <div class="text-sm text-gray-600">@{props.user.login}</div>
      )}
    </div>
  );
}

export function UserNameHorizontal(props: { class?: string; user: User }) {
  return (
    <span class={props.class}>
      <span class="font-semibold">
        {props.user.name || `@${props.user.login}`}
      </span>
      {props.user.name && (
        <span class="text-gray-600">{" "}(@{props.user.login})</span>
      )}
    </span>
  );
}
