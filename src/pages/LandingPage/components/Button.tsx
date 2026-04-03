const Button = ({ onClick, icon, label, bgColor, textColor }: any) => {
  return (
    <button
      className={`flex space-x-3 w-full text-xl py-4 items-center justify-center rounded-lg cursor-pointer hover:opacity-70 duration-300 transition-all`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {icon}
      <p className="font-semibold">{label}</p>
    </button>
  )
}

export default Button