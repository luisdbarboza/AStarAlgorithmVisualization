import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Graph } from '../../classes/graph';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  stateChangedSubject = new Subject<any>();

  generateGraph(dimensions: number = 10) {
    const myGraph = new Graph();
    let vertexNumber = 1;
    const distanceBetweenNodes = 10;
    for (let row = 0; row < dimensions; row++) {
      for (let column = 0; column < dimensions; column++) {
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
    }


    return myGraph;
  }
}
