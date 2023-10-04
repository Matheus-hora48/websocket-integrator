import axios from 'axios';

class SyncFili {
  public async execute(): Promise<void> {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getFiliDest() {
        const response = await axios.get (
          `http://127.0.0.1:3001/filiais/select`
        );
        return response.data;
      }

      async function getFiliSrc() {
        const response = await axios.get (
          `url_api_bussines`  // Substitua pela URL correta da API de filiais
        );
        return response.data;
      }

      const selectSrc = await getFiliSrc();
      const selectDest = await getFiliDest();

      for (const itemSrc of selectSrc) {
        if (selectDest.length === 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.coddomi === itemSrc.coddomi &&
              itemDois.id_fili === itemSrc.id_fili
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (
            this.changeTime(itemSrc.updated_at) !==
            this.changeTime(itemDest.updated_at)
          ) {
            listUpdate.push(itemSrc);
          }
        }
      }

      console.log("Iniciando o sync das filiais");

      if (listInsert.length > 0) {
        for (const row of this.removeDuplicates(listInsert)) {
          const dataInsert = {
            coddomi: row.coddomi,
            cnpfili: row.cnpfili,
            id_fili: row.id_fili,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/filiais/enviar`,
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
        for (const row of this.removeDuplicates(listUpdate)) {
          const itemFound = selectDest.find(
            (itemDois) =>
              itemDois.coddomi === row.coddomi && itemDois.id_fili === row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/filiais/${itemFound?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              coddomi: row.coddomi,
              cnpfili: row.cnpfili,
              id_fili: row.id_fili,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.coddomi}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.coddomi}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      console.log("Sincronização das filiais finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  public removeDuplicates(listInsert) {
    return listInsert
      .map((item) => JSON.stringify(item))
      .filter((item, index, self) => self.indexOf(item) === index)
      .map((item) => JSON.parse(item));
  }

  public changeTime(date) {
    if (date !== null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncFili();
