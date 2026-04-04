
type LogoProps = {
    width?: number
    height?: number
    textSize?: number
    classname?: string
}

const Logo = ({ width=24, height=24, textSize=30, classname }: LogoProps) => {
    return (
        <div className={`${classname} flex items-center space-x-1`}>
            <img src="/images/logo.svg" alt="GitPulse Logo" width={width} height={height} className="animate-pulse" />
            <h1 className='text-white font-semibold' style={{ fontSize: textSize + "px" }}>
                Git<span className='text-secondaryTextColor'>Pulse</span>
            </h1>
        </div>
    )
}

export default Logo