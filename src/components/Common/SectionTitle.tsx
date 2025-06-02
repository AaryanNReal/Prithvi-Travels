const SectionTitle = ({
  title,
  paragraph,
  width = "800px",
  center,
  mb = "30px",
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
}) => {
  return (
    <>
      <div
        className={`w-full ${center ? "mx-auto text-center" : ""}`}
        style={{ maxWidth: width, marginBottom: mb }}
      >
        <h2 className="mb-4 text-[35px] font-bold leading-tight! text-black dark:text-white">
          {title}
        </h2>
        <p className="text-base leading-relaxed! text-body-color md:text-lg">
          {paragraph}
        </p>
      </div>
    </>
  );
};

export default SectionTitle;
