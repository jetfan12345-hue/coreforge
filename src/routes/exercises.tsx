import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/exercises")({
  component: ExercisesLayout,
});

function ExercisesLayout() {
  return <Outlet />;
}
