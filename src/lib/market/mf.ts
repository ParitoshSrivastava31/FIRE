export async function getMutualFundNAV(schemeCode: string) {
  try {
    const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, {
      next: { revalidate: 3600 } 
    })
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    
    if (data && data.data && data.data.length > 0) {
      const latestNav = data.data[0]
      return {
        nav: parseFloat(latestNav.nav),
        date: latestNav.date,
        name: data.meta.scheme_name
      }
    }
    return null
  } catch (error) {
    console.error(`Error fetching NAV for scheme ${schemeCode}:`, error)
    return null
  }
}
