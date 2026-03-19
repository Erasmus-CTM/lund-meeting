export interface ChoiceOption {
  index: number;
  //   text: string;
  input: HTMLInputElement;
}

export interface ChoiceQuestion {
  options: ChoiceOption[];
}
