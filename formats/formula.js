import Embed from '../blots/embed';

class Formula extends Embed {
  static create(value) {
    let node = super.create(value);
    node.style.position = "relative";
    let mathNode = document.createElement("div");
    mathNode.style.display = "inline-block";
    mathNode.className = "mathNode";
    if (typeof value === 'string') {
      node.setAttribute('data-value', value);
    }
    node.appendChild(mathNode);
    return node;
  }
  constructor(value) {
    super(value);
    let mathNode = getMathNode(this.domNode)
    this.renderMath(value.getAttribute("data-value"), mathNode)
    mathNode.addEventListener('click', (() => this.edit([-1])));
  }
  editContainer() {
    var container = document.createElement("div");
    container.className = "editContainer";
    container.style.display = "inline-block";
    return container;
  }
  enter(args) {
    this.edit(args)
  }
  exit() {
    let parent = this.domNode.children[0]
    let editContainers = parent.getElementsByClassName("editContainer");
    let editContainer = editContainers[0]
    let mathNode = getMathNode(editContainer)
    parent.replaceChild(mathNode, editContainer)
  }
  edit(args) {
    let mathNodes = this.domNode.getElementsByClassName("mathNode");
    if (mathNodes.length !== 1) {
      throw new Error()
    }
    let mathNode = mathNodes[0];
    let mathNodeParent = mathNode.parentNode
    let editContainer = this.editContainer();
    mathNodeParent.removeChild(mathNode);
    editContainer.appendChild(mathNode);
    mathNodeParent.appendChild(editContainer);
    let editArea = this.getEditor();
    let editAreaContainer = document.createElement("div");
    editAreaContainer.appendChild(editArea)
    let val = this.contentNode.getAttribute("data-value")
    editArea.value = val;
    editContainer.appendChild(editAreaContainer);
    editArea.focus();
    const [entryIndex, initialFlag] = args
    if(entryIndex>window.quill.getIndex(this)&&initialFlag!=="initial") {
      editArea.setSelectionRange(0, 0);
    } else if (initialFlag === "initial") {
      editArea.setSelectionRange(0, 2);
    }
  }
  getEditor() {
    let editArea = document.createElement("textarea");
    editArea.style.position = "absolute";
    editArea.style.minWidth = "100px";
    editArea.style.width = "100%";
    editArea.style.outline = "none";
    editArea.style.resize = "none";
    editArea.addEventListener('input', (e) => this.inputHandler(e, this.domNode))
    editArea.addEventListener("keydown", (e) => keyHandler(e, this))
    editArea.addEventListener('blur', () => this.exit())
    return editArea;
  }
  renderMath(value, mathNode) {
    const processedValue = this.preprocessor(value);
    try {
      window.katex.render(processedValue, mathNode, {
        throwOnError: false,
        errorColor: '#f00'
      })
    } catch(err) {
      mathNode.innerHTML = err.message;
    }
  }
  preprocessor(value) {

    /* Pre-processes the string before rendering with KaTeX
       Allows for things like adding \begin{aligned} tags
       or using Asciimath.
    */
    return value;
  }
  inputHandler(e, domNode) {
    let newVal = e.srcElement.value
    let mathNode = getMathNode(domNode)

    this.renderMath(newVal, mathNode)
    domNode.setAttribute('data-value', newVal);
  }
  static value(domNode) {
    const val = domNode.getAttribute('data-value');
    return val;
  }
}
Formula.blotName = 'formula';
Formula.className = 'ql-formula';
Formula.tagName = 'SPAN';
const keyHandler = (e, ctx) => {
  const selectionLength = e.srcElement.value.length;
  const cursorLocation = e.srcElement.selectionEnd;
  const key = e.key;
  let curIndex = window.quill.getIndex(ctx)
  if (cursorLocation <= 0 && key === "ArrowLeft") {
    window.quill.setSelection(5, 1, "user")
    window.quill.setSelection(curIndex, 1, "user")
    ctx.exit(e.srcElement)
  }
  if (cursorLocation >= selectionLength && key === "ArrowRight") {
    curIndex = window.quill.getIndex(ctx)
    window.quill.setSelection(curIndex+1, 1, "user")
    ctx.exit(e.srcElement)
  }

}
const getMathNode = (domNode) => {
  let mathNodes = domNode.getElementsByClassName("mathNode")
  if (mathNodes.length !== 1) {
    var err = new Error();
    throw err
  } else {
    return mathNodes[0]
  }
}
export default Formula;
