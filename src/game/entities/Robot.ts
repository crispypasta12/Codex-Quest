export type RobotState = "broken" | "working" | "happy";

export type RobotDefinition = {
  id: "berrybot";
  name: "Berry Bot";
  state: RobotState;
};
