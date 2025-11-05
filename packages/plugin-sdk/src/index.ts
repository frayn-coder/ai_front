import { z } from 'zod'

export const ToolSpecSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  parameters: z.record(z.any()).default({}),
  invoke: z.function().args(z.any()).returns(z.promise(z.any())),
  ui: z.any().optional()
})

export type ToolSpec = z.infer<typeof ToolSpecSchema>

export interface PluginHost {
  register(spec: ToolSpec): void
  invoke(name: string, args: unknown): Promise<unknown>
}

export class InMemoryPluginHost implements PluginHost {
  private registry = new Map<string, ToolSpec>()

  register(spec: ToolSpec) {
    const parsed = ToolSpecSchema.parse(spec)
    this.registry.set(parsed.name, parsed)
  }

  async invoke(name: string, args: unknown) {
    const spec = this.registry.get(name)
    if (!spec) {
      throw new Error(`Tool ${name} not registered`)
    }
    return spec.invoke(args)
  }

  list() {
    return Array.from(this.registry.values())
  }
}
