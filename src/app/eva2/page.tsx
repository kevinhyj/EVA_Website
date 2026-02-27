export default function EVA2Page() {
  return (
    <div className="min-h-screen flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <iframe
        src="/Arc_RNAlife.pdf"
        className="w-full flex-1"
        style={{ border: "none", minHeight: "calc(100vh - 64px)" }}
        title="Arc RNAlife"
      />
    </div>
  );
}
