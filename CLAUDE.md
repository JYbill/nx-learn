# 架构概览

这是一个 Nx 22、pnpm、ESM TypeScript 和 NestJS 工作区。工作区包位于 `apps/**` 和 `libs/**`，实际 Nx 项目包括：

- `esm-nest-swc`：位于 `apps/esm-nest-swc` 的 Nest 应用。
- `@nx-learn/common`：位于 `libs/common` 的共享库。
- `@nx-learn/test`：位于 `libs/test` 的共享或演示库。

`esm-nest-swc` 通过 `src/main.ts` 启动 `AppModule`，全局前缀为 `/api`，监听 `process.env.PORT || 3000`。`AppModule` 导入 `ScheduleModule.forRoot()`，注册 `AppController`、`AppService` 和 `CronService`。控制器从 `@nx-learn/common` 导入 `CommonCls`，运行一个 `class-validator` 示例后返回 `AppService.getData()`。

库依赖方向是 `apps -> @nx-learn/common -> @nx-learn/test`：应用使用 `CommonCls`；`CommonCls.debug()` 调用 `@nx-learn/test` 中的 `common()`。

本仓库使用 NodeNext ESM 包导出，而不是 TypeScript `paths`。`tsconfig.base.json` 将 `moduleResolution` 和 `module` 设为 `nodeNext`，并启用 `@nx-learn/source` 自定义条件。内部库的 `package.json` 会把 `@nx-learn/source` 指向 `./src/index.ts`，普通导入指向 `./dist/index.js`。相对 TypeScript 导入保持显式 `.js` 后缀。

Nx 目标主要由 `nx.json` 中配置的插件推断，包括 `@nx/js/typescript`、`@nx/eslint/plugin` 和 `@nx/vitest`，项目级覆盖写在各自的 `project.json` 中。`esm-nest-swc` 在 `project.json` 中覆盖 `build`，先通过 `nest build` 使用 SWC 构建，再执行 `esm-nest-swc:typecheck`。`test` 目标由 `@nx/vitest` 根据 `apps/esm-nest-swc/vitest.config.ts` 隐式推断，coverage 目录以 `vitest.config.ts` 为准。根脚本 `check-nx-task` 只运行 `typecheck build lint`。

Claude Code skill 支持位于 `.claude/skills`。根脚本 `skills:update` 会安装 `nrwl/nx-ai-agents-config` 和 `upgrade-project` skill，`skills-lock.json` 记录 skill 版本；这些文件影响 Claude Code / slash command 行为，不影响应用构建产物。

# 测试要求

编辑代码后优先运行本次修改相关的少量测试文件，例如 `pnpm exec vitest run apps/esm-nest-swc/src/app/app.service.spec.ts`；需要走 Nx 目标时再运行 `pnpm exec nx run esm-nest-swc:test`。

## `*.spec.ts`

- 单元测试。
- 放在源码同级目录。
- 只测试纯代码逻辑、DTO、工具函数、service 分支。
- 不访问真实数据库，不访问外部服务。

## `*.integration-spec.ts`

- 集成测试。
- 放在源码同级目录。
- 允许依赖环境变量访问真实外部服务。
- 默认只读，避免污染共享环境。
- 适合测试数据库、Redis、网络请求等。
- 禁止对外部依赖进行 mock，必须使用真实数据。

## `*.e2e-spec.ts`

- 端到端测试。
- 通过 HTTP 接口测试完整链路。
- 使用专门的测试数据库或测试 schema。
- 每轮测试前准备 seed 数据，测试后清理或重建。
- 可以测试 CRUD，但重点是关键业务流程，而不是所有 CRUD 细节。
- e2e 测试文件放在 `tests/` 目录内。

当前没有单独的 e2e project 和 seed 基础设施。新增模块或文件时，应在源码同级目录补对应的 `*.spec.ts` 和 `*.integration-spec.ts`；只有具备测试数据库、seed 和清理方案时，再新增 `*.e2e-spec.ts`。

# 实现原则与禁止行为

- 默认沿用现有 Nest、Nx、TypeScript 和 ESM 组织方式。
- 优先复用现有实现，不新增平行方案。
- 修改范围最小化，不做无关重构或顺手优化。
- 不为了“更优雅”提前新增抽象；只有确认会复用时再抽取。
- 不无故删除已有注释；如果注释错误、过期或表达不清，优先修正。
- 修改含中文的文件时，确保 UTF-8 中文不乱码。
- 新增类型、返回值或 DTO 时，用准确类型解决问题，不用 `any`、`unknown`、`as any`、`as unknown as ...` 掩盖类型错误。
- 状态值、类型值、任务值、开关值等业务常量不要散落魔法数字；需要新增时先抽成有语义的常量或枚举。
- 用户提供报错信息时，先定位原因和归属，再给最小修改方案。
- 相对 TypeScript 导入保持现有 NodeNext ESM 写法，继续使用显式 `.js` 后缀。
- 除非用户明确要求或已说明充分理由，不绕过 Nx 目标直接新建一套构建、测试或启动流程。
- 除非用户明确要求，不执行 `git add`、提交、改写提交或推送。
