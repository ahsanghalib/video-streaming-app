import { Consumer, Producer, Transport, MediaKind } from "mediasoup/lib/types";

class Peer {
  sessionId: string;
  transports: Transport[];
  producers: Producer[];
  consumers: Consumer[];
  process: any | undefined;
  remotePorts: number[];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.transports = [];
    this.producers = [];
    this.consumers = [];
    this.process = undefined;
    this.remotePorts = [];
  }

  addTransport(transport: Transport) {
    this.transports.push(transport);
  }

  getTransport(transportId: string) {
    return this.transports.find((transport) => transport.id === transportId);
  }

  addProducer(producer: Producer) {
    this.producers.push(producer);
  }

  getProducer(producerId: string) {
    return this.producers.find((producer) => producer.id === producerId);
  }

  getProducersByKind(kind: MediaKind) {
    return this.producers.filter((producer) => producer.kind === kind);
  }

  getConsumersByKind(kind: MediaKind) {
    return this.consumers.filter((consumer) => consumer.kind === kind);
  }
}

export default Peer;
