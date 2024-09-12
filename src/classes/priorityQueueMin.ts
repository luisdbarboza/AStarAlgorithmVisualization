export class PriorityQueue {
  data: Array<any> = [];
  evaluator: (value: any) => any;
  comparisonFunction: (a: any, b: any) => boolean;

  constructor(
    type: 'MIN' | 'MAX' = 'MIN',
    evaluator: ((value: any) => any) | null = null,
    comparisonFunction: ((a: any, b: any) => boolean) | null = null
  ) {
    this.data = [];
    this.evaluator = evaluator ? evaluator : (value: any) => value;
    this.comparisonFunction = comparisonFunction
      ? comparisonFunction
      : type === 'MIN'
      ? (a, b) => a < b
      : (a, b) => a > b;
  }

  insert(value: any) {
    if (this.data.length === 0) {
      this.data.push(value);
      return;
    }

    this.data.push(value);

    //check if value is greather than the last item of the array
    let indexInsertedNode = this.data.length - 1;
    while (true) {
      if (indexInsertedNode == 0) return true;

      const indexParentNode = Math.floor((indexInsertedNode + 1) / 2) - 1;
      const parentNode = this.data[indexParentNode];

      if (
        this.comparisonFunction(
          this.evaluator(value),
          this.evaluator(parentNode)
        )
      ) {
        this.data[indexInsertedNode] = parentNode;
        this.data[indexParentNode] = value;
        indexInsertedNode = indexParentNode;
      } else {
        return true;
      }
    }
  }

  erase(index: number) {
    let removedValue = null;
    if (index > this.data.length - 1 || index < 0) return false;
    if (index == 0 && this.data.length === 1) {
      removedValue = this.data.pop();
      return removedValue;
    }

    let nodeAtIndex = this.data[0] + 1; //100
    removedValue = this.data[index];
    let indexNode = index;

    while (indexNode !== 0) {
      const indexParentNode = Math.floor((indexNode + 1) / 2) - 1;
      const parentNode = this.data[indexParentNode];

      this.data[indexNode] = parentNode;
      this.data[indexParentNode] = nodeAtIndex;
      indexNode = indexParentNode;
      nodeAtIndex = this.data[indexNode];
    }

    const lastNode = this.data.pop();
    this.data[indexNode] = lastNode;
    let currentNode = null;

    while (true) {
      const indexLeftChild = Math.floor((indexNode + 1) * 2) - 1;
      const indexRightChild = indexLeftChild + 1;

      if (
        this.data.length === 2 &&
        !this.comparisonFunction(
          this.evaluator(this.data[0]),
          this.evaluator(this.data[1])
        )
      ) {
        const aux = this.data[0];
        this.data[0] = this.data[1];
        this.data[1] = aux;
        break;
      }

      if (
        this.data.length === 2 &&
        this.comparisonFunction(
          this.evaluator(this.data[0]),
          this.evaluator(this.data[1])
        )
      ) {
        break;
      }

      if (
        currentNode !== null &&
        this.comparisonFunction(
          this.evaluator(currentNode),
          this.evaluator(this.data[indexLeftChild])
        ) &&
        currentNode !== null &&
        this.comparisonFunction(
          this.evaluator(currentNode),
          this.evaluator(this.data[indexRightChild])
        )
      ) {
        break;
      }

      if (
        indexNode > this.data.length - 1 ||
        indexLeftChild > this.data.length - 1 ||
        indexRightChild > this.data.length - 1
      ) {
        break;
      }

      let childThatMeetsCriteria = this.comparisonFunction(
        this.evaluator(this.data[indexLeftChild]),
        this.evaluator(this.data[indexRightChild])
      )
        ? 'LEFT'
        : 'RIGHT';

      if (childThatMeetsCriteria == 'LEFT') {
        const aux = this.data[indexNode];
        this.data[indexNode] = this.data[indexLeftChild];
        this.data[indexLeftChild] = aux;

        indexNode = indexLeftChild;
        currentNode = this.data[indexLeftChild];
      } else if (childThatMeetsCriteria == 'RIGHT') {
        const aux = this.data[indexNode];
        this.data[indexNode] = this.data[indexRightChild];
        this.data[indexRightChild] = aux;

        indexNode = indexRightChild;
        currentNode = this.data[indexRightChild];
      }
    }

    return removedValue;
  }

  indexOf(targetValue: any) {
    return this.data.findIndex((value) => value === targetValue);
  }

  dequeue() {
    return this.erase(0);
  }

  print() {
    if (this.data.length == 0) {
      return;
    }

    if (this.data.length == 1) {
      console.log(this.data);
      return;
    }

    let numberOfLevels = Math.floor(Math.log2(this.data.length - 1)) + 1;
    let currentLevel = 0;
    while (numberOfLevels >= 0) {
      let startIndex = 2 ** currentLevel - 1;
      let endIndex = startIndex + 2 ** currentLevel;

      if (endIndex > this.data.length) endIndex = this.data.length;

      console.log(this.data.slice(startIndex, endIndex));
      numberOfLevels--;
      currentLevel++;
    }
  }

  isEmpty() {
    return this.data.length === 0;
  }

  peek() {
    if (!this.isEmpty()) {
      return this.data[0];
    }
  }
}

/*
myPriorityQueue.insert(99);
myPriorityQueue.insert(93);
myPriorityQueue.insert(94);
myPriorityQueue.insert(88);
myPriorityQueue.insert(83);
myPriorityQueue.insert(70);
myPriorityQueue.insert(49);
myPriorityQueue.insert(49);
myPriorityQueue.insert(6);
myPriorityQueue.insert(10);
myPriorityQueue.insert(71);
myPriorityQueue.insert(13);
myPriorityQueue.insert(58);
myPriorityQueue.insert(27);
myPriorityQueue.insert(12);


myPriorityQueue.print();

console.log(myPriorityQueue.dequeue());
myPriorityQueue.print();

console.log(myPriorityQueue.dequeue());
myPriorityQueue.print();
*/
