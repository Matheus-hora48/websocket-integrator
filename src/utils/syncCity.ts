import axios from 'axios';

class SyncCity {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getCitDest() {
        const response = await axios.get('http://127.0.0.1:3001/cidades/select');
        return response.data;
      }

      async function getCitSrc() {
        const response = await axios.get('url_api_bussines');
        return response.data;
      }

      const selectSrc = await getCitSrc();

      const selectDest = await getCitDest();

      for (const itemSrc of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.codmuni == itemSrc.codmuni &&
              itemDois.id_fili == itemSrc.id_fili
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (this.changeTime(itemSrc.updated_at) != this.changeTime(itemDest.updated_at)) {
            listUpdate.push(itemSrc);
          }
        }
      }

      console.log("Iniciando o sync das cidades");

      if (listInsert.length > 0) {
        for (const row of this.removeDuplicates(listInsert)) {
          const dataInsert = {
            codmuni: row.codmuni,
            uf_muni: row.uf_muni,
            nommuni: row.nommuni,
            id_fili: row.id_fili,
            updated_at: row.updated_at,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/cidades/enviar`,
            headers: {
              "Content-Type": "application/json",
            },
            data: dataInsert,
          };

          try {
            await axios(config);
          } catch (e) {
            console.error(`Erro ao inserir registro: ${JSON.stringify(dataInsert)}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      if (listUpdate.length > 0) {
        for (const row of this.removeDuplicates(listUpdate)) {
          const itemFound = selectDest.find(
            (itemDois) =>
              itemDois.codmuni == row.codmuni && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/cidades/${itemFound?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              codmuni: row.codmuni,
              uf_muni: row.uf_muni,
              nommuni: row.nommuni,
              id_fili: row.id_fili,
              updated_at: row.updated_at,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.codparc}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.codparc}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      console.log("Sincronização das cidades finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  removeDuplicates(listInsert) {
    return listInsert
      .map((item) => JSON.stringify(item))
      .filter((item, index, self) => self.indexOf(item) === index)
      .map((item) => JSON.parse(item));
  }

  changeTime(date) {
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncCity();
