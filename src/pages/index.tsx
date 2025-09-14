import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { siteConfig } from "@/config/site";

import SvgViewer from "@/components/svg-viewer";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-6">
        <div className="inline-block max-w-2xl text-center self-center">
          <h1 className={title()}>{siteConfig.name}</h1>
          <p className={subtitle({ class: "mt-4" })}>{siteConfig.description}</p>
        </div>
        <SvgViewer />
      </section>
    </DefaultLayout>
  );
}
