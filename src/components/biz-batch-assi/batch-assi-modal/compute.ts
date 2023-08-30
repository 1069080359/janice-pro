let div: HTMLDivElement | undefined;

const createDom = () => {
  if (!div) {
    div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '-1000px';
    div.style.opacity = '0';
    document.body.appendChild(div);
  }
  return div;
};

export const computeWidth = (str: string, isLast: boolean, alw: number = 0) => {
  const dom = createDom();
  dom.innerText = str;
  const { width } = dom.getBoundingClientRect();
  if (isLast) {
    dom.remove();
    div = undefined;
  }
  return width + alw;
};
