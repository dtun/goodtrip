import AboutCard from "@/components/cards/aboutcard";

export default function About() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden pb-10 flex-col p-2">
      <div className="group w-full overflow-auto">
        <div className="max-w-xl mx-auto mt-10 mb-24">
          <AboutCard />
        </div>
      </div>
    </div>
  );
}
