
type LogoProps = {
    width?: number
    height?: number
    textSize?: number
    classname?: string
}

const Logo = ({ width=24, height=24, textSize=30, classname }: LogoProps) => {
    return (
        <div className={`${classname ?? ""} flex items-center gap-2`}>
            <img src="/images/logo.svg" alt="" aria-hidden="true" width={width} height={height} />
            <span className="font-semibold tracking-[-0.04em] text-white" style={{ fontSize: textSize + "px" }}>
                Git<span className="text-secondaryTextColor">Arc</span>
            </span>
        </div>
    )
}

export default Logo
