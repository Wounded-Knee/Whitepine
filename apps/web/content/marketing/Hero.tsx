export function Hero({ children, className = '', firstSection = true, backgroundImage }: { children: React.ReactNode, className: string, firstSection: boolean, backgroundImage: string }) {
    const bgClassName = className + (className.includes('bg-contain') ? '' : ' bg-cover');
    
    return (
        <section 
            className={`
                ${ bgClassName }
                ${ firstSection ? '-mt-6' : '' }
                h-[50vh]
                p-6
                rounded-b-lg
                bg-no-repeat
                bg-center
                -ml-6
                -mr-6
                mb-6
                flex
                items-end
                justify-start
            `}
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="[&>h1]:mb-0 [&>h1]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] [&>h2]:mb-0 [&>h2]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] [&>h3]:mb-0 [&>h3]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] [&>h4]:mb-0 [&>h4]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] [&>h5]:mb-0 [&>h5]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] [&>h6]:mb-0 [&>h6]:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                {children}
            </div>
        </section>
    )
}
