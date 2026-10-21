import { Component } from "@/domain/models/component"

import { prisma } from "./prisma"

export type InventorySource = () => Promise<Component[]>

export async function getAllComponents(): Promise<Component[]> {
  return prisma.component.findMany()
}

export async function createComponent(
  data: Omit<Component, "id">,
): Promise<Component> {
  return prisma.component.create({ data })
}

export async function updateComponent(
  input: Partial<Component> & { id: Component["id"] },
): Promise<Component> {
  const { id, ...data } = input

  return prisma.component.update({
    where: { id },
    data,
  })
}

export async function deleteComponent(id: Component["id"]): Promise<Component> {
  return prisma.component.delete({
    where: { id },
  })
}
