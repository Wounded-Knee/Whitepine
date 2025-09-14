export function Hero({ backgroundImage }: { backgroundImage: string }) {
    return (
        <div 
            className="w-full max-w-1xl mx-auto rounded-lg shadow-lg my-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <h1>Hero</h1>
        </div>
    )
}
