<script>

  let mostrarInformacio = $state(false);

  function alternarInformacio() {
    mostrarInformacio = !mostrarInformacio;
  }

</script>

  <button type="button" onclick={alternarInformacio} aria-expanded={mostrarInformacio}>
    {mostrarInformacio ? 'Amagar informació' : 'Mostrar informació'}
  </button>

  {#if mostrarInformacio}
    <section>
      <h2>Informació addicional</h2>
      <p>Aquesta aplicació permet als usuaris explorar dades geogràfiques de Catalunya de manera interactiva.</p>
    </section>
  {/if}

<style>



  p {
    color: #475569;
    line-height: 1.6;
  }

  button {
  padding: 10px 16px;
  background-color: #166534;
  color: white;
  border: none;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

button:hover {
  background-color: #14532d;
}

button:focus {
  outline: 2px solid #166534;
  outline-offset: 2px;
}   

section {
  margin-top: 20px;
  padding: 16px;
  background-color: #e8efe5;
  border-left: 4px solid #166534;
}

</style>
