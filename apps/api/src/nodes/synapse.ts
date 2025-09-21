import { model as SynapseNodeModel, schema as synapseNodeSchema } from '../models/SynapseNode';
import baseNode from './base';
import { NODE_TYPES } from '@whitepine/types';

const synapseNodeSelectionCriteria = {
  ...baseNode.selectionCriteria
  // No additional criteria for synapses - inherits base criteria only
};

const synapseNodeHandlers = baseNode.handlers;

export default {
    kind: NODE_TYPES.SYNAPSE,
    model: SynapseNodeModel,
    schema: synapseNodeSchema,
    selectionCriteria: synapseNodeSelectionCriteria,
    handlers: synapseNodeHandlers
};
