// Type imports of static images (`import logo from "x.png"`). Next generates
// next-env.d.ts with this reference on build, but that file is gitignored, so
// typecheck in a fresh checkout (CI) needs it declared here.
/// <reference types="next/image-types/global" />
