# 运行环境与工具链

- 当前开发环境使用 Node.js 26 和 pnpm 11；依赖安装与锁文件更新统一使用 pnpm，不新增其他包管理器的锁文件。
- 工作区使用 Nx 22、NestJS 11、TypeScript 6 和 NodeNext ESM。
- `esm-nest-swc` 通过 Nest CLI 和 SWC 构建，构建目标同时执行 TypeScript 类型检查，产物入口为 `apps/esm-nest-swc/dist/main.js`。
- 代码质量工具为 ESLint、Prettier 和 Vitest；Nx 目标是项目级检查的统一入口。

# 常用命令

```bash
# 编辑代码后，优先只检查和格式化本次修改的文件。
pnpm exec eslint path/to/file.ts --fix
pnpm exec prettier --write "path/to/file.ts"

# 应用级类型检查、构建与测试。
pnpm exec nx run esm-nest-swc:typecheck
pnpm build:esm-nest-swc
pnpm exec nx run esm-nest-swc:test

# 工作区全量类型检查、代码检查和构建。
pnpm check-nx-task
```

编辑代码后优先运行本次修改相关的检查和测试；需要扩大验证范围时，再运行对应项目的 Nx 目标或工作区全量命令。修改代码检查、格式化或测试工具时，同步检查 Nx 配置、提交前检查和 CI 中的实际调用方。

# 架构概览

这是一个 Nx 22、pnpm、ESM TypeScript 和 NestJS 工作区。工作区包位于 `apps/**` 和 `libs/**`，实际 Nx 项目包括：

- `esm-nest-swc`：位于 `apps/esm-nest-swc` 的 Nest 应用。
- `@nx-learn/common`：位于 `libs/common` 的共享库。
- `@nx-learn/test`：位于 `libs/test` 的共享或演示库。

`esm-nest-swc` 通过 `src/main.ts` 启动 `AppModule`，全局前缀为 `/api`，监听 `process.env.PORT || 3000`。`AppModule` 导入 `ScheduleModule.forRoot()`，注册 `AppController`、`AppService` 和 `CronService`。控制器从 `@nx-learn/common` 导入 `CommonCls`，运行一个 `class-validator` 示例后返回 `AppService.getData()`。

库依赖方向是 `apps -> @nx-learn/common -> @nx-learn/test`：应用使用 `CommonCls`；`CommonCls.debug()` 调用 `@nx-learn/test` 中的 `common()`。

本仓库使用 NodeNext ESM 包导出，而不是 TypeScript `paths`。`tsconfig.base.json` 将 `moduleResolution` 和 `module` 设为 `nodeNext`，并启用 `@nx-learn/source` 自定义条件。内部库的 `package.json` 会把 `@nx-learn/source` 指向 `./src/index.ts`，普通导入指向 `./dist/index.js`。相对 TypeScript 导入保持显式 `.js` 后缀。

Nx 目标主要由 `nx.json` 中配置的插件推断，包括 `@nx/js/typescript`、`@nx/eslint/plugin` 和 `@nx/vitest`，项目级覆盖写在各自的 `project.json` 中。`esm-nest-swc` 在 `project.json` 中覆盖 `build`，先通过 `nest build` 使用 SWC 构建，再执行 `esm-nest-swc:typecheck`。`test` 目标由 `@nx/vitest` 根据 `apps/esm-nest-swc/vitest.config.ts` 隐式推断，coverage 目录以 `vitest.config.ts` 为准。根脚本 `check-nx-task` 只运行 `typecheck build lint`。

Agent skill 位于 `.agents/skills`。根脚本 `skills:update` 会安装 `nrwl/nx-ai-agents-config` 和 `upgrade-project` skill，`skills-lock.json` 记录 skill 版本；这些文件影响 Agent 行为，不影响应用构建产物。

# 校验约定

- 当前项目使用 `class-validator` 和 `class-transformer`，尚未采用 Zod Standard Schema，也未注册全局 `ValidationPipe`。
- 继续沿用现有 class validator 体系；除非用户明确要求迁移，否则不引入另一套请求校验方案，也不移除现有校验依赖。
- 当前控制器中的 `validate()` 是手动校验示例，不能把它视为所有路由都会自动执行的请求校验。

# 测试要求

编辑代码后优先运行本次修改相关的少量测试文件，例如 `pnpm exec vitest run apps/esm-nest-swc/src/app/app.service.spec.ts`；需要走 Nx 目标时再运行 `pnpm exec nx run esm-nest-swc:test`。

## `*.spec.ts`

- 单元测试。
- 放在源码同级目录。
- 只测试纯代码逻辑、DTO、工具函数、Service 分支。
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

# 标准文档

`docs/spec/` 用于存放项目标准文档。新增或调整标准文档时，同步维护 `docs/spec/index.md`；当前尚无该目录，第一次新增标准文档时一并创建目录和索引。

# 类型声明

- 每个 app 或 lib 的全局声明统一放在自身 `src/app.d.ts`，包括框架或第三方库的 module augmentation；不要在工作区根目录新增平行的 `types/` 目录。
- 只服务某个源码文件的 `type` 或 `interface` 优先写在该源码文件内；需要拆出时放到源码同层的 `源码名.d.ts`，例如 `auth.service.ts` 对应 `auth.service.d.ts`。
- 跨多个源码文件复用、但不属于全局声明的类型，放在对应 app、lib 或业务模块内，通过正常 ESM 导入导出，不要挂到 global。
- 不使用 `*.types.d.ts` 这类额外命名；只作为类型使用的导入使用 `import type` 或内联 `type`。

# 实现原则与禁止行为

- 默认沿用现有 Nest、Nx、TypeScript 和 ESM 组织方式。
- 优先复用现有实现，不新增平行方案。
- 修改范围最小化，不做无关重构或顺手优化。
- 不为了“更优雅”提前新增抽象；只有确认会复用时再抽取。
- 不无故删除已有注释；如果注释错误、过期或表达不清，优先修正。
- 修改含中文的文件时，确保 UTF-8 中文不乱码。
- 新增类型、返回值或 DTO 时，用准确类型解决问题，不用 `any`、`unknown`、`as any`、`as unknown as ...` 掩盖类型错误。
- 状态值、类型值、任务值、开关值等业务常量不要散落魔法数字或魔法字符串；需要新增时先抽成有语义的常量或枚举。
- Controller 只处理路由、参数解析、鉴权装饰器和响应入口，不写业务流程。
- Service 承载业务逻辑、事务编排和外部依赖调用，不直接把基础设施错误原样暴露给客户端。
- 新增持久化逻辑时，查询操作优先放在 `*-query.ts`，新增、更新和删除操作优先放在 `*-modify.ts`。
- 新增应用配置时集中装配和校验；除启动入口所需的 `PORT` 外，不在业务代码中散落读取 `process.env`。
- 不提交密钥、token、数据库连接串、个人环境配置或会污染共享环境的测试数据。
- 用户提供报错信息时，先定位原因和归属，再给最小修改方案。
- 相对 TypeScript 导入保持现有 NodeNext ESM 写法，继续使用显式 `.js` 后缀；只作为类型使用的导入使用 `import type` 或内联 `type`。
- 除非用户明确要求或已说明充分理由，不绕过 Nx 目标另建构建、测试或启动流程。
- 除非用户明确要求，不执行 `git add`、提交、改写提交或推送。
