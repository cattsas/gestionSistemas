
export default function generateColumns (props) {

    if (!props || props.length === 0) return [];
  
    const keys = Object.keys(props[0]);
  
    const cols= keys.map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
    }))

    
    return cols

  }