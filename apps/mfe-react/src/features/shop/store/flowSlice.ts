import { createSlice, type PayloadAction, type Middleware } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Which pipeline node an action lights up in the diagram.
export type FlowStage = 'thunk' | 'api' | 'reducer';

interface FlowState {
  lastActionType: string | null;
  stage: FlowStage | null;
  seq: number; // monotonically increasing so identical actions still re-trigger
}

const initialState: FlowState = { lastActionType: null, stage: null, seq: 0 };

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    recordAction(state, action: PayloadAction<{ type: string; stage: FlowStage }>) {
      state.lastActionType = action.payload.type;
      state.stage = action.payload.stage;
      state.seq += 1;
    },
  },
});

export const { recordAction } = flowSlice.actions;
export default flowSlice.reducer;

export const selectFlow = (s: RootState) => s.flow;

function stageFor(type: string): FlowStage {
  if (type.endsWith('/pending')) return 'thunk';
  if (type.endsWith('/fulfilled') || type.endsWith('/rejected')) return 'api';
  return 'reducer';
}

// Middleware that stamps every non-flow action into the flow slice, so the
// live diagram can highlight the stage the action just travelled through.
export const flowMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type;
  if (type && !type.startsWith('flow/')) {
    store.dispatch(recordAction({ type, stage: stageFor(type) }));
  }
  return result;
};
