const list = ( enm: Record<string,unknown> ): string[] => {
    const values = [] as string[]
    for(const key in enm) {
        values.push(enm[key] as string)
    }
    return values
}

export { list }