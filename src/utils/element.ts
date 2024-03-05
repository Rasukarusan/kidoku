export const toggleNoScrollBody = (toggle: boolean) => {
  if (toggle) {
    document.body.classList.add('no-scroll')
  } else {
    document.body.classList.remove('no-scroll')
  }
}
