export function Hero({ children, backgroundImage }: { children: React.ReactNode, backgroundImage: string }) {
    return (
        <section 
            className="h-[50vh] p-6 rounded-b-lg shadow-lg bg-cover bg-center -mt-6 -ml-6 -mr-6"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            { children }
        </section>
    )
}
