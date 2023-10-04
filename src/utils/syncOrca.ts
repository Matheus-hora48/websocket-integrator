import axios from 'axios';
import { changeTime } from './utils';

require('dotenv').config()

const API_URL = process.env.API_URL;

class SyncOrca {
  async execute() {
    try {
      const listInsert = [];
      const listUpdate = [];

      const selectSrc = await this.getOrcaSrc();
      const selectDest = await this.getOrcaDest();
      const listCodusua = await this.getCodusua();

      for (const itemSrc of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.codorca == itemSrc.codorca &&
              itemDois.id_fili == itemSrc.id_fili
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (
            changeTime(itemSrc.updated_at) !=
            changeTime(itemDest.updated_at)
          ) {
            listUpdate.push(itemSrc);
          }
        }
      }

      const listOrcaSrc = (listInsert).filter((row) =>
        listCodusua.some((cod) => cod.codusua === row.codusua)
      );

      console.log("Iniciando o sync dos orçamentos");

      if (listInsert.length > 0) {
        await this.insertOrca(listOrcaSrc);
      }

      if (listUpdate.length > 0) {
        await this.updateOrca(listUpdate, selectDest);
      }

      console.log("Sincronização dos orçamentos finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  async getOrcaDest() {
    const response = await axios.get(`${API_URL}/orcamentos/select`);
    return response.data;
  }

  async getOrcaSrc() {
    const response = await axios.get('url_api_bussines');
    return response.data;
  }

  async getCodusua() {
    const response = await axios.get(`${API_URL}/vendedores/codigo`);
    return response.data;
  }

  async insertOrca(listInsert) {
    for (const row of listInsert) {
      const dataInsert = {
        codorca: row.codorca,
        codfili: row.codfili,
        resseri: row.resseri,
        id_fili: row.id_fili,
        datpedi: row.datpedi,
        codclie: row.codclie,
        codusua: row.codusua,
        vlrorca: row.vlrorca,
        vlrliqu: row.vlrliqu,
        nomparc: row.nomparc,
        staorca: row.staorca,
        cidade: row.cidade,
        produtos: {},
        updated_at: row.updated_at,
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${API_URL}/orcamentos/enviar`,
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

  async updateOrca(listUpdate, selectDest) {
    for (const row of listUpdate) {
      const itemAchado = selectDest.find(
        (itemDois) =>
          itemDois.codorca == row.codorca && itemDois.id_fili == row.id_fili
      );

      const config = {
        method: "put",
        maxBodyLength: Infinity,
        url: `${API_URL}/orcamentos/${itemAchado?.id}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          codorca: row.codorca,
          codfili: row.codfili,
          resseri: row.resseri,
          id_fili: row.id_fili,
          datpedi: row.datpedi,
          codclie: row.codclie,
          codusua: row.codusua,
          vlrorca: row.vlrorca,
          vlrliqu: row.vlrliqu,
          nomparc: row.nomparc,
          staorca: row.staorca,
          cidade: row.cidade,
          produtos: {},
          updated_at: row.updated_at,
        },
      };

      try {
        await axios(config);
        console.log(`Registro atualizado com sucesso: ${row.codorca}`);
      } catch (e) {
        console.error(`Erro ao atualizar registro: ${row.codorca}`);
        console.error(`Detalhes do erro: ${e}`);
      }
    }
  }
}

export default new SyncOrca();