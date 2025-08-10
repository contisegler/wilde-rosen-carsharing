// etner states that can be used throuout the project here like this
// export const useCounter = () => useState<number>('counter', () => 0)
// in the pages/componenets you can use the
// const counter = useCounter()
// in the script section

export const useUsername = () => useState<string>("username", () => "")
export const useLoginError = () => useState<Error | null | undefined>("loginError", () => null)
