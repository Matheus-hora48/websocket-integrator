import axios from 'axios';

class SyncVede {
  public async execute(): Promise<void> {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getVendedorDest() {
        const response = await axios.get(
          `http://127.0.0.1:3001/vendedores/select`
        );
        return response.data;
      }

      async function getVendedorSrc() {
        const response = await axios.get (
          `url_api_vendedor`  // Substitua pela URL correta da API de vendedores
        );
        return response.data;
      }

      const selectSrc = await getVendedorSrc();
      const selectDest = await getVendedorDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codusua == itemUm.codusua &&
              itemDois.id_fili == itemUm.id_fili
          );

          if (!itemAchado) {
            listInsert.push(itemUm);
          } else if (
            this.changeTime(itemUm.updated_at) !=
            this.changeTime(itemAchado.updated_at)
          ) {
            listUpdate.push(itemUm);
          }
        }
      }

      console.log("Iniciando o sync dos vendedores");

      if (listInsert.length > 0) {
        for (const row of listInsert) {
          const dataInsert = {
            codusua: row.codusua,
            id_fili: row.id_fili,
            logusua: row.logusua,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/vendedores/enviar`,
            headers: {
              "Content-Type": "application/json",
            },
            data: dataInsert,
          };

          try {
            await axios(config);
          } catch (e) {
            console.error(
              `Erro ao inserir registro: ${JSON.stringify(dataInsert)}`
            );
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      if (listUpdate.length > 0) {
        for (const row of listUpdate) {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codusua == row.codusua && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/vendedores/${itemAchado?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              codusua: row.codusua,
              id_fili: row.id_fili,
              logusua: row.logusua,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.codusua}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.codusua}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      console.log("Sincronização dos vendedores finalizada");

    } catch (err) {
      console.error(err);
    }
  }

  public changeTime(date: string) {
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncVede();