import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export type Phase = 'measurement' | 'patterns' | 'visual';
export enum Step {
  GARMENT = 'GARMENT',
  MEASURE = 'MEASURE',
  FABRIC = 'FABRIC',
  PATTERN = 'PATTERN',
  PREVIEW = 'PREVIEW',
  VIRTUAL_FIT = 'VIRTUAL_FIT',
  REVIEW_EXPORT = 'REVIEW_EXPORT',
}

export type Selection = {
  garmentType?: 'shirt' | 'tshirt' | 'pant';
  color?: string;
  fabricId?: string;
  patternId?: string;
  measurements?: Record<string, number>;
  vizConfig?: Record<string, unknown>;
};

type State = {
  phase: Phase;
  step: Step;
  selection: Selection;
  completed: Set<Step>;
};

type Action =
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'SET_STEP'; step: Step }
  | { type: 'UPDATE_SELECTION'; patch: Partial<Selection> }
  | { type: 'MARK_COMPLETE'; step: Step }
  | { type: 'RESET_FROM'; step: Step };

const initialState: State = {
  phase: 'measurement',
  step: Step.GARMENT,
  selection: {},
  completed: new Set<Step>(),
};

const STORAGE_KEY = 'tailor.workflow.v1';

function computePhaseFromStep(s: Step): Phase {
  if (s === Step.GARMENT || s === Step.MEASURE) return 'measurement';
  if (s === Step.FABRIC || s === Step.PATTERN) return 'patterns';
  return 'visual';
}

function initFromStorage(base: State): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as {
      phase?: Phase;
      step?: Step;
      selection?: Selection;
      completed?: Step[];
    };
    const step = parsed.step && Object.values(Step).includes(parsed.step) ? parsed.step : base.step;
    const phase = parsed.phase ?? computePhaseFromStep(step);
    const selection = parsed.selection ?? base.selection;
    const completed = new Set<Step>((parsed.completed ?? []).filter((s: any) => Object.values(Step).includes(s)) as Step[]);
    return { phase, step, selection, completed };
  } catch {
    return base;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'UPDATE_SELECTION':
      return { ...state, selection: { ...state.selection, ...action.patch } };
    case 'MARK_COMPLETE': {
      const completed = new Set(state.completed);
      completed.add(action.step);
      return { ...state, completed };
    }
    case 'RESET_FROM': {
      const completed = new Set(state.completed);
      (Object.values(Step) as Step[]).forEach((s) => {
        if (s >= action.step) completed.delete(s);
      });
      return { ...state, completed };
    }
    default:
      return state;
  }
}

export const stepOrder: Step[] = [
  Step.GARMENT,
  Step.MEASURE,
  Step.FABRIC,
  Step.PATTERN,
  Step.PREVIEW,
  Step.VIRTUAL_FIT,
  Step.REVIEW_EXPORT,
];

export function validateStep(step: Step, selection: Selection): boolean {
  switch (step) {
    case Step.GARMENT:
      return !!selection.garmentType;
    case Step.MEASURE:
      return !!selection.measurements && Object.keys(selection.measurements).length > 0;
    case Step.FABRIC:
      return !!selection.fabricId && !!selection.color;
    case Step.PATTERN:
      return !!selection.patternId;
    case Step.PREVIEW:
      return true;
    case Step.VIRTUAL_FIT:
      return true;
    case Step.REVIEW_EXPORT:
      return true;
    default:
      return false;
  }
}

type Ctx = State & {
  canAdvance: boolean;
  next: () => void;
  back: () => void;
  goTo: (step: Step) => void;
  setPhaseByStep: (s: Step) => void;
  update: (patch: Partial<Selection>) => void;
};

const WorkflowContext = createContext<Ctx | null>(null);

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, initFromStorage);

  const setPhaseByStep = useCallback((s: Step) => {
    if (s === Step.GARMENT || s === Step.MEASURE) dispatch({ type: 'SET_PHASE', phase: 'measurement' });
    else if (s === Step.FABRIC || s === Step.PATTERN) dispatch({ type: 'SET_PHASE', phase: 'patterns' });
    else dispatch({ type: 'SET_PHASE', phase: 'visual' });
  }, []);

  const goTo = useCallback((s: Step) => {
    setPhaseByStep(s);
    dispatch({ type: 'SET_STEP', step: s });
  }, [setPhaseByStep]);

  const next = useCallback(() => {
    const idx = stepOrder.indexOf(state.step);
    if (idx < 0 || idx === stepOrder.length - 1) return;
    const currentValid = validateStep(state.step, state.selection);
    if (currentValid) {
      dispatch({ type: 'MARK_COMPLETE', step: state.step });
      const nextStep = stepOrder[idx + 1];
      setPhaseByStep(nextStep);
      dispatch({ type: 'SET_STEP', step: nextStep });
    }
  }, [state.step, state.selection, setPhaseByStep]);

  const back = useCallback(() => {
    const idx = stepOrder.indexOf(state.step);
    if (idx <= 0) return;
    const prevStep = stepOrder[idx - 1];
    setPhaseByStep(prevStep);
    dispatch({ type: 'SET_STEP', step: prevStep });
  }, [state.step, setPhaseByStep]);

  const update = useCallback((patch: Partial<Selection>) => {
    dispatch({ type: 'UPDATE_SELECTION', patch });
  }, []);

  const canAdvance = useMemo(() => validateStep(state.step, state.selection), [state.step, state.selection]);

  const value: Ctx = { ...state, canAdvance, next, back, goTo, setPhaseByStep, update };

  // persist to localStorage
  useEffect(() => {
    try {
      const toStore = {
        phase: state.phase,
        step: state.step,
        selection: state.selection,
        completed: Array.from(state.completed),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // ignore write failures
    }
  }, [state.phase, state.step, state.selection, state.completed]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}
