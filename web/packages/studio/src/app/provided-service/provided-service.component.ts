import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-provided-service',
  templateUrl: './provided-service.component.html',
  styleUrls: ['./provided-service.component.css']
})
export class ProvidedServiceComponent implements OnInit {
  messageContent: string;

  constructor() { }

  ngOnInit() {
    this.messageContent = this.messageContentString;
    this.formatAndUpdateArea();
  }

  format(messageStr) {
    return JSON.stringify(JSON.parse(messageStr), null, 2);
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
    console.info(this.messageContent);
  }

  messageContentString = `{
    "build-client": "cd ./packages/client && yarn build",
    "build-common": "cd ./packages/common && yarn build ",
    "build-e2e": "cd ./packages/e2e && yarn build",
    "build-web-example": "cd ./packages/web-example && yarn build",
    "build-electron-launcher": "cd ./packages/electron-launcher && yarn build",
    "build-protocol": "cd ./packages/protocol && yarn build",
    "build-transport-common": "cd ./packages/transport-common && yarn build",
    "build-websocket-transport": "cd ./packages/websocket-transport && yarn build",
    "build-quickstart-viewer": "cd ./packages/ccy-pair-rate-viewer && yarn build",
    "build-quickstart-provider": "cd ./packages/ccy-pair-rate-provider && yarn build",
    "build-core": "run-s build-common build-transport-common build-websocket-transport build-client",
    "build-all": "run-s build-common build-protocol build-transport-common build-websocket-transport build-client build-electron-launcher build-e2e build-web-example build-quickstart-viewer build-quickstart-provider",
    "build-all-win": "run-s build-all benchmarks e2e",
    "prebuild-all": "yarn install",
    "e2e": "cd ./packages/e2e && yarn electron-e2e",
    "poste2e": "yarn coverage",
    "coverage": "nyc report --reporter=text --reporter=html",
    "benchmarks": "cd ./packages/e2e && yarn electron-e2e-benchmarks"
  }`;

}
