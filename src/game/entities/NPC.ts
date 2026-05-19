export type NPCId = "byte";

export type NPCDefinition = {
  id: NPCId;
  name: string;
  role: string;
};

export const byteNpc: NPCDefinition = {
  id: "byte",
  name: "Byte",
  role: "Robot Teacher",
};
