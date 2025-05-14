// Types for Simulation related components and data

// Base Simulation type
export interface Simulation {
  id: string;
  title: string;
  description: string;
  pdf_url: string;
  time_in_min: number;
  is_complete: boolean;
  card_id: string;
  year?: number;
  subject?: string;
}

// Extended simulation type with user-specific data
export interface UserSimulation extends Simulation {
  is_completed: boolean;
  is_started: boolean;
  is_flagged: boolean;
}

// Simulation card type
export interface SimulationCard {
  id: string;
  title: string;
  description: string;
  year: number;
  subject: string;
  order_index: number | null;
  simulations: UserSimulation[];
}

// Solution type
export interface Solution {
  id: string;
  simulation_id: string;
  title: string;
  pdf_url: string;
  order_index: number | null;
}

// Props for client components
export interface ClientSimulationsPageProps {
  simulationCardsByYear: Record<number, SimulationCard[]>;
  sortedYears: number[];
  userId: string;
}

export interface SimulationClientProps {
  simulation: Simulation;
  userId: string;
  hasStarted: boolean;
  isCompleted: boolean;
  completedSimulationId: string | null;
  startedAt: string | null;
}

export interface SolutionsClientProps {
  simulation: Simulation;
  solutions: Solution[];
}
