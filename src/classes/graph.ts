import { PriorityQueue } from './priorityQueueMin';

type nodeValue = number | string;
type edgeDirection = 'bidirectional' | 'unidirectional';

export class Graph {
  length: number = 0;
  adjacencyMatrix: Record<string, any>;

  edgeDirections = {
    bidirectional: true,
    unidirectional: true,
  };

  constructor() {
    this.length = 0;
    this.adjacencyMatrix = {};
  }

  addVertex(value: nodeValue) {
    if (!this.adjacencyMatrix[value])
      this.adjacencyMatrix[value] = {
        metadata: { walkable: true, value },
        columns: {},
      };

    for (let vertex in this.adjacencyMatrix) {
      this.adjacencyMatrix[vertex].columns[value] = { connected: 0 };
    }
    this.length++;
  }

  addEdge(
    node1: nodeValue,
    node2: nodeValue,
    weight = 1,
    direction: edgeDirection = 'bidirectional',
    sourceNode: nodeValue | null = null
  ) {
    if (direction == 'bidirectional') sourceNode = null;

    if (!(direction in this.edgeDirections)) {
      console.log('Invalid direction provided');
    }

    if (
      (direction == 'unidirectional' && sourceNode === null) ||
      (sourceNode &&
        direction == 'unidirectional' &&
        ![node1, node2].includes(sourceNode))
    ) {
      console.log(
        'Invalid unidirectional edge, ' +
          sourceNode +
          " isn't any of the vertex"
      );
      return;
    }

    if (node1 in this.adjacencyMatrix && node2 in this.adjacencyMatrix) {
      if (direction === 'bidirectional') {
        this.adjacencyMatrix[node1].columns[node2] = {
          connected: 1,
          direction,
          weight,
        };
        this.adjacencyMatrix[node2].columns[node1] = {
          connected: 1,
          direction,
          weight,
        };
      }

      if (direction === 'unidirectional') {
        if (node1 === sourceNode) {
          this.adjacencyMatrix[node1].columns[node2] = {
            connected: 1,
            direction,
            sourceNode,
            weight,
          };
        } else if (node2 === sourceNode) {
          this.adjacencyMatrix[node2].columns[node1] = {
            connected: 1,
            direction,
            sourceNode,
            weight,
          };
        }
      }
    } else {
      console.log('nodes arent in the graph');
    }
  }

  showConnections() {
    for (const key in this.adjacencyMatrix) {
      let displayMessage = `${key} --> `;
      for (const key2 in this.adjacencyMatrix[key].columns) {
        if (this.adjacencyMatrix[key].columns[key2].connected == 1) {
          displayMessage += key2 + ' ';
        }
      }

      console.log(displayMessage);
    }
  }

  breadthFirstSearch(startingNode: nodeValue) {
    if (!(startingNode in this.adjacencyMatrix)) return null;

    const queue = [String(startingNode)];
    const visitedNodes: Array<nodeValue> = [];
    const visitedNodesHash: Record<nodeValue, boolean> = {};
    const addedToQueue: Record<nodeValue, boolean> = {};

    while (queue.length) {
      const currentNode = queue.shift() as string;
      visitedNodesHash[currentNode] = true;
      visitedNodes.push(currentNode);

      for (const key in this.adjacencyMatrix[currentNode].columns) {
        if (
          this.adjacencyMatrix[currentNode].columns[key].direction ===
            'bidirectional' &&
          this.adjacencyMatrix[currentNode].columns[key].connected === 1 &&
          !visitedNodesHash[key] &&
          !addedToQueue[key]
        ) {
          queue.push(key);
          addedToQueue[key] = true;
        } else if (
          this.adjacencyMatrix[currentNode].columns[key].direction ===
            'unidirectional' &&
          this.adjacencyMatrix[currentNode].columns[key].connected === 1 &&
          this.adjacencyMatrix[currentNode].columns[key].sourceNode ===
            currentNode &&
          !visitedNodesHash[key] &&
          !addedToQueue[key]
        ) {
          queue.push(key);
          addedToQueue[key] = true;
        }
      }

      console.log('Visited node: ', currentNode, 'queue: ' + queue);
    }

    return visitedNodes;
  }

  depthFirstSearch(
    node: nodeValue,
    visitedNodesHash: Record<nodeValue, boolean> = {},
    visitedNodes: Array<nodeValue> = []
  ) {
    if (!(node in this.adjacencyMatrix)) return;

    node = String(node);

    const bifurcations = [];

    if (!visitedNodesHash[node]) {
      console.log('Visited node', node);
      visitedNodesHash[node] = true;
      visitedNodes.push(node);
    }

    for (const node2 in this.adjacencyMatrix[node].columns) {
      if (
        this.adjacencyMatrix[node].columns[node2].direction ===
          'bidirectional' &&
        this.adjacencyMatrix[node].columns[node2].connected === 1 &&
        !visitedNodesHash[node2]
      ) {
        bifurcations.push(node2);
      } else if (
        this.adjacencyMatrix[node].columns[node2].direction ===
          'unidirectional' &&
        this.adjacencyMatrix[node].columns[node2].connected === 1 &&
        this.adjacencyMatrix[node].columns[node2].sourceNode === node &&
        !visitedNodesHash[node2]
      ) {
        bifurcations.push(node2);
      }
    }

    if (bifurcations.length === 0) return;

    for (const branchNode of bifurcations) {
      this.depthFirstSearch(branchNode, visitedNodesHash, visitedNodes);
    }

    return visitedNodes;
  }

  dijkstraShortestPath(
    node: nodeValue,
    endNode: nodeValue,
    accum = 0,
    nodesMetadata: Record<string, any> = {},
    visitedNodes: Array<nodeValue> = []
  ): { shortestPath: number; visitedNodes: Array<nodeValue> } {
    if (!nodesMetadata[node]) {
      nodesMetadata[node] = {};
      nodesMetadata[node].visited = true;
    } else {
      nodesMetadata[node].visited = true;
    }
    visitedNodes.push(node);

    if (node === endNode) return { shortestPath: accum, visitedNodes };

    const priorityQueue = new PriorityQueue("MIN", (obj) =>
      obj && 'weight' in obj ? obj.weight : obj
    );

    //update estimates
    for (const node2 in this.adjacencyMatrix[node].columns) {
      if (this.adjacencyMatrix[node].columns[node2].connected === 1) {
        if (!nodesMetadata[node2])
          nodesMetadata[node2] = { visited: false, estimated: null };

        if (!nodesMetadata[node2].visited) {
          if (nodesMetadata[node2].estimated === null) {
            nodesMetadata[node2].estimated =
              accum + this.adjacencyMatrix[node].columns[node2].weight;
          } else if (
            nodesMetadata[node2].estimated !== null &&
            nodesMetadata[node2].estimated >
              accum + this.adjacencyMatrix[node].columns[node2].weight
          ) {
            nodesMetadata[node2].estimated =
              accum + this.adjacencyMatrix[node].columns[node2].weight;
          }

          priorityQueue.insert({
            weight: nodesMetadata[node2].estimated,
            node: node2,
          });
        }
      }
    }

    while (!priorityQueue.isEmpty()) {
      const nextNode = priorityQueue.dequeue();
      const returnValue = this.dijkstraShortestPath(
        nextNode.node,
        endNode,
        nextNode.weight,
        nodesMetadata,
        visitedNodes
      );

      if (returnValue.shortestPath !== -1) return returnValue;
    }

    priorityQueue.print();

    visitedNodes.pop();

    //chose next vertex to explore

    return { shortestPath: -1, visitedNodes };
  }

  addOrRemoveObstacle(vertex: nodeValue) {
    if (!this.adjacencyMatrix[vertex].metadata) {
      this.adjacencyMatrix[vertex].metadata = { walkable: false };
    } else {
      this.adjacencyMatrix[vertex].metadata.walkable =
        !this.adjacencyMatrix[vertex].metadata.walkable;
    }
  }

  //this method assumes the distance between edges are 10 or 14
  aStarPathfinding(
    startNode: nodeValue,
    endNode: nodeValue,
    currentNode: any = null,
    priorityQueue: PriorityQueue | null = null
  ): any {
    if (priorityQueue === null) {
      priorityQueue = new PriorityQueue("MIN", null, (a, b) => {
        return a?.metadata.fCost === b?.metadata.fCost
          ? a?.metadata.hCost < b?.metadata.hCost
          : a?.metadata.fCost < b?.metadata.fCost;
      });
    }

    //base cases
    if (currentNode === endNode) {
      const stack = [];
      let nodeInPath = currentNode;

      this.adjacencyMatrix[nodeInPath].metadata.shortesPathPart = true;
      stack.push(nodeInPath);

      while ('previousPointer' in this.adjacencyMatrix[nodeInPath].metadata) {
        stack.push(this.adjacencyMatrix[nodeInPath].metadata.previousPointer);
        nodeInPath = this.adjacencyMatrix[nodeInPath].metadata.previousPointer;
        this.adjacencyMatrix[nodeInPath].metadata.shortesPathPart = true;
      }
      console.log('PATH encontrado', stack);

      return { path: stack, length: stack.length };
    }

    if (
      !this.adjacencyMatrix[startNode].metadata.walkable ||
      !this.adjacencyMatrix[endNode].metadata.walkable
    ) {
      return { path: [], length: 0 };
    }

    if (!currentNode) {
      currentNode = this.adjacencyMatrix[startNode];
      this.adjacencyMatrix[startNode].metadata.gCost = 0;
      this.adjacencyMatrix[startNode].metadata.hCost =
        this.calculateDistanceRelativeToTargetNode(
          startNode as number,
          endNode as number
        );
      currentNode.metadata.fCost =
        currentNode.metadata.hCost + currentNode.metadata.gCost;
    } else {
      currentNode = this.adjacencyMatrix[currentNode];
    }
    currentNode.metadata.visited = true;

    console.log("Current node", currentNode.metadata.value);

    //scanning surrounding nodes
    for (const node2 in this.adjacencyMatrix[currentNode.metadata.value]
      .columns) {
      if (
        this.adjacencyMatrix[currentNode.metadata.value].columns[node2]
          .connected === 1 &&
        !this.adjacencyMatrix[node2].metadata.visited &&
        this.adjacencyMatrix[node2].metadata.walkable
      ) {
        //calculate hCost
        const hCost = this.calculateDistanceRelativeToTargetNode(
          Number(node2),
          endNode as number
        );

        //calculate gCost

        const gCost = Math.floor(
          currentNode.metadata.gCost +
            this.adjacencyMatrix[currentNode.metadata.value].columns[node2]
              .weight
        );

        const fCost = gCost + hCost;

        if (
          !('fCost' in this.adjacencyMatrix[node2].metadata) ||
          ('fCost' in this.adjacencyMatrix[node2].metadata &&
            fCost < this.adjacencyMatrix[node2].metadata.fCost)
        ) {
          this.adjacencyMatrix[node2].metadata.hCost = hCost;
          this.adjacencyMatrix[node2].metadata.gCost = gCost;
          this.adjacencyMatrix[node2].metadata.fCost = fCost;
          this.adjacencyMatrix[node2].metadata.previousPointer =
            currentNode.metadata.value;

          const indexToReinsert = priorityQueue.indexOf(
            this.adjacencyMatrix[node2]
          );
          priorityQueue.erase(indexToReinsert);
          priorityQueue.insert(this.adjacencyMatrix[node2]);
        }

        //calculate fCost
        if (!this.adjacencyMatrix[node2].metadata.scanned) {
          priorityQueue.insert(this.adjacencyMatrix[node2]);
          this.adjacencyMatrix[node2].metadata.scanned = true;
        }
      }
    }

    const nextElement = priorityQueue.dequeue();

    //recursive case
    if (nextElement) {
      return this.aStarPathfinding(
        startNode,
        endNode,
        nextElement.metadata.value,
        priorityQueue
      );
    } else {
      return { path: [], length: 0 };
    }
  }

  calculateDistanceRelativeToTargetNode(
    currentNode: number,
    targetNode: number
  ): number {
    //25
    //verticalDistance = 2
    //horizontal distance = 5
    //calculate horizontal distance between currentNode and endNode
    //calculate vertical distance between currentNode and endNode
    let horizontalPositionTargetNode = targetNode % 10;
    const targetNodeDividedBy10 = targetNode / 10;
    const verticalPositionTargetNode =
      targetNode % 10 === 0
        ? Math.floor(targetNodeDividedBy10) - 1
        : Math.floor(targetNodeDividedBy10);
    let horizontalPositionCurrentNode = currentNode % 10;
    const currentNodeDividedBy10 = currentNode / 10;
    const verticalPositionCurrentNode =
      currentNode % 10 === 0
        ? Math.floor(currentNodeDividedBy10) - 1
        : Math.floor(currentNodeDividedBy10);
    const distanceBetweenNodes = 10;

    if (horizontalPositionTargetNode === 0) {
      horizontalPositionTargetNode = 10;
    }

    if (horizontalPositionCurrentNode === 0) {
      horizontalPositionCurrentNode = 10;
    }

    //si la distancia vertical o la horizontal son 0, multiplicar la distancia por el peso de la arista
    //si tanto la distancia vertical como la horizontal son ambas diferentes de 0
    //multiplicar el peso de la arista diagonal tantas veces como para que la diferencia vertical pase a ser 0
    //luego multiplicar el peso de las aritas horizontales por la diferencia horizontal restante

    const horizontalDistanceBetweenCurrentNodeAndTargetNode = Math.abs(
      horizontalPositionTargetNode - horizontalPositionCurrentNode
    );
    const verticalDistanceBetweenCurrentNodeAndTargetNode = Math.abs(
      verticalPositionTargetNode - verticalPositionCurrentNode
    );

    const diagonalDistance = Math.sqrt(
      distanceBetweenNodes ** 2 + distanceBetweenNodes ** 2
    );

    if (
      horizontalDistanceBetweenCurrentNodeAndTargetNode === 0 ||
      verticalDistanceBetweenCurrentNodeAndTargetNode === 0
    ) {
      const distance =
        horizontalDistanceBetweenCurrentNodeAndTargetNode >
        verticalDistanceBetweenCurrentNodeAndTargetNode
          ? horizontalDistanceBetweenCurrentNodeAndTargetNode
          : verticalDistanceBetweenCurrentNodeAndTargetNode;

      return distance * 10;
    } else if (
      horizontalDistanceBetweenCurrentNodeAndTargetNode ===
      verticalDistanceBetweenCurrentNodeAndTargetNode
    ) {
      return Math.floor(
        horizontalDistanceBetweenCurrentNodeAndTargetNode * diagonalDistance
      );
    } else if (
      horizontalDistanceBetweenCurrentNodeAndTargetNode > 0 &&
      verticalDistanceBetweenCurrentNodeAndTargetNode > 0
    ) {
      if (
        horizontalDistanceBetweenCurrentNodeAndTargetNode >
        verticalDistanceBetweenCurrentNodeAndTargetNode
      ) {
        const accumInDiagonalMultiplication =
          verticalDistanceBetweenCurrentNodeAndTargetNode * diagonalDistance;
        const leftInHorizontal = Math.abs(
          horizontalDistanceBetweenCurrentNodeAndTargetNode -
            verticalDistanceBetweenCurrentNodeAndTargetNode
        );
        const accumInHorizontalMultiplication = leftInHorizontal * 10;

        return Math.floor(
          accumInHorizontalMultiplication + accumInDiagonalMultiplication
        );
      } else if (
        verticalDistanceBetweenCurrentNodeAndTargetNode >
        horizontalDistanceBetweenCurrentNodeAndTargetNode
      ) {
        const accumInDiagonalMultiplication =
          horizontalDistanceBetweenCurrentNodeAndTargetNode * diagonalDistance;
        const leftInVertical = Math.abs(
          verticalDistanceBetweenCurrentNodeAndTargetNode -
            horizontalDistanceBetweenCurrentNodeAndTargetNode
        );
        const accumInVerticalMultiplication = leftInVertical * 10;

        return Math.floor(
          accumInVerticalMultiplication + accumInDiagonalMultiplication
        );
      }
    }

    return 0;
  }
}
