import type { UIComponent } from "../contracts/ui";

interface FeedbackBoxProps {
  text: string;
  causedBy?: string;
  index: number;
  count: number;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

export const FeedbackBox: UIComponent<FeedbackBoxProps> = (props) => {
  const root = document.createElement("div");
  root.className = "activity-feedback";

  if (props.causedBy) {
    const causeEl = document.createElement("div");
    causeEl.className = "feedback-cause";
    causeEl.textContent = `${props.causedBy}`;
    root.append(causeEl);
  }
  const body = document.createElement("div");
  body.className = "feedback-body";
  body.textContent = props.text;

  root.append(body);

  const nav = document.createElement("div");
  nav.className = "feedback-nav";

  const prev = document.createElement("button");
  prev.textContent = "←";
  prev.disabled = !props.onPrev;
  if (props.onPrev) {
    prev.onclick = props.onPrev;
  }

  const next = document.createElement("button");
  next.textContent = "→";
  next.disabled = !props.onNext;
  if (props.onNext) {
    next.onclick = props.onNext;
  }

  const counter = document.createElement("span");
  counter.className = "feedback-counter";
  counter.textContent = `${props.index + 1}/${props.count}`;

  nav.append(prev, next, counter);
  root.append(nav);

  return root;
};
