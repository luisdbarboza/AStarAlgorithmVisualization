import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Graph } from '../classes/graph';
import { GraphService } from './services/graph.service';

type panelButtons = 'adding-obstacles' | 'adding-startEndNodes' | 'nothing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  graphService = inject(GraphService);
  title = 'aStarVisualization';
  mode: panelButtons = 'nothing';
  dimension: Array<{ id: number }> = [];
  lastGraphState?: Graph;
  graph: Graph = this.graphService.generateGraph();
  startNode?: number;
  endNode?: number;
  algorithmApplied = false;

  constructor() {
    for (const number of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      this.dimension.push({
        id: number,
      });
    }
    this.lastGraphState = JSON.parse(JSON.stringify(this.graph));
  }

  generateGraph() {
    const myGraph = new Graph();
    let vertexNumber = 1;
    const distanceBetweenNodes = 10;
    this.dimension = [];
    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        myGraph.addVertex(vertexNumber);
        if (column > 0) {
          myGraph.addEdge(vertexNumber - 1, vertexNumber, distanceBetweenNodes);
        }
        if (row > 0) {
          if (column > 0) {
            myGraph.addEdge(
              vertexNumber - 11,
              vertexNumber,
              Math.sqrt(distanceBetweenNodes ** 2 + distanceBetweenNodes ** 2)
            );
          }
          myGraph.addEdge(
            vertexNumber - 10,
            vertexNumber,
            distanceBetweenNodes
          );

          if (column < 9) {
            myGraph.addEdge(
              vertexNumber - 9,
              vertexNumber,
              Math.sqrt(distanceBetweenNodes ** 2 + distanceBetweenNodes ** 2)
            );
          }
        }

        vertexNumber++;
      }

      this.dimension.push({
        id: row + 1,
      });
    }

    this.lastGraphState = JSON.parse(JSON.stringify(myGraph));

    return myGraph;
  }

  handleNodeClick(index: number) {
    switch (this.mode) {
      case 'adding-obstacles':
        return this.addRemoveObstacle(index);
      case 'adding-startEndNodes':
        return this.addStartEndNodes(index);
      case 'nothing':
      default:
        return;
    }
  }

  addStartEndNodes(index: number) {
    if (this.startNode === index) return (this.startNode = undefined);
    if (this.endNode === index) return (this.endNode = undefined);

    if (this.startNode !== undefined && this.endNode !== undefined) return;

    if (this.startNode === undefined) return (this.startNode = index);

    if (this.endNode === undefined) return (this.endNode = index);

    return;
  }

  addRemoveObstacle(index: number) {
    return this.graph?.addOrRemoveObstacle(index);
  }

  handlePanelButtonClick(mode: panelButtons) {
    if (this.algorithmApplied) {
      this.graph = this.generateGraph();
      this.startNode = undefined;
      this.endNode = undefined;
      this.algorithmApplied = false;
    }

    if (this.mode === mode) {
      this.mode = 'nothing';
      return;
    }
    if (this.mode !== mode) {
      this.mode = mode;
    }
  }

  executeAStar() {
    if (this.startNode !== undefined && this.endNode !== undefined) {
      this.graph.aStarPathfinding(this.startNode, this.endNode);
      this.algorithmApplied = true;
    } else {
      alert('No has establecido los nodos de inicio y final');
    }
  }
}
