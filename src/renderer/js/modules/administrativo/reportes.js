document.getElementById("manualmente").onclick = async () => {
  const btn = document.getElementById("manualmente");
  btn.disabled = true;
  btn.textContent = "Generando...";

  try {
    const resp = await fetch("http://localhost:3000/reportes/generar-manual");
    const data = await resp.json();

    if (data.ok) {
      alert("Reporte generado exitosamente");
      // Abrimos el PDF en una pestaña nueva
      window.open(
        `http://localhost:3000/reportes/ver-general/${data.archivo}`,
        "_blank",
      );
    }
  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
  } finally {
    btn.disabled = false;
    btn.textContent = "Manualmente";
  }
};
