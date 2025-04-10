function Header() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-semibold text-white">Face Skin Analyzer</h1> {/* White header */}
      <p className="mt-2 text-lg text-gray-400"> {/* Lighter description text */}
        A face condition detector trained on a custom dataset with fastai. Kindly upload a partial photo of your face.
      </p>
    </div>
  );
}

export default Header;