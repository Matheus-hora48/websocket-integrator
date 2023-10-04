import axios from 'axios';

class SyncPros {
  public async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getProsDest() {
        const response = await axios.get(
          `http://127.0.0.1:3001/prospects/select`
        );
        return response.data;
      }

      async function getProsSrc(){
        const response = await axios.get(
          `url_api_bussines`  // Substitua pela URL correta da API de prospects
        );
        return response.data;
      }

      const selectSrc = await getProsSrc();
      const selectDest = await getProsDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codparc == itemUm.codparc &&
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

      console.log("Iniciando o sync dos prospects");

      if (listInsert.length > 0) {
        for (const row of this.removeDuplicates(listInsert)) {
          const dataInsert = {
            cadparc: row.cadparc,
            coddomi: row.coddomi,
            id_fili: row.id_fili,
            nomparc: row.nomparc,
            sobparc: row.sobparc,
            cgcende: row.cgcende,
            fonende: row.fonende,
            codparc: row.codparc,
            codcida: row.codcida,
            usuparc: row.usuparc,
            is_leds: row.is_leds,
            is_parc: row.is_parc,
            updated_at: row.updated_at,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/prospects/enviar`,
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
              itemDois.codparc == row.codparc && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/prospects/${itemAchado?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              cadparc: row.cadparc,
              coddomi: row.coddomi,
              id_fili: row.id_fili,
              nomparc: row.nomparc,
              sobparc: row.sobparc,
              cgcende: row.cgcende,
              fonende: row.fonende,
              codcida: row.codcida,
              usuparc: row.usuparc,
              is_leds: row.is_leds,
              is_parc: row.is_parc,
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
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncPros();
